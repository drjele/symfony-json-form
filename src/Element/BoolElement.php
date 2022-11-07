<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Element\Traits\ReadonlyTrait;
use Drjele\Symfony\JsonForm\Element\Traits\RequiredTrait;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

/** checkbox html element */
class BoolElement extends AbstractElement
{
    use ReadonlyTrait;
    use RequiredTrait;

    public function __construct(
        string $name,
        string $label
    ) {
        parent::__construct($name, $label);
    }

    protected function getType(): string
    {
        return 'bool';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_bool($value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        return [
            'readonly' => $this->readonly,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
