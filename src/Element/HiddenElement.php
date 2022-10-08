<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Symfony\Contracts\Translation\TranslatorInterface;

class HiddenElement extends AbstractElement
{
    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
    ) {
    }

    protected function getType(): string
    {
        return 'hidden';
    }

    protected function renderElement(mixed $value, ?TranslatorInterface $translator): array
    {
        if (null !== $value && false === \is_scalar($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'value' => $value,
        ];
    }
}
