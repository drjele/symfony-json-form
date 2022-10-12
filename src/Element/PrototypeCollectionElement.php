<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Drjele\Symfony\JsonForm\Traits\ElementCollectionTrait;

/** used for repeatable collections of elements */
class PrototypeCollectionElement extends AbstractElement
{
    use ElementCollectionTrait;

    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly bool $renderDefault = true
    ) {
    }

    public function getType(): string
    {
        return 'prototypeCollection';
    }

    public function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_array($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        $elements = [];

        foreach (($value ?? []) as $v) {
            $elements[] = $this->renderElements($v);
        }

        if (true === $this->renderDefault && null === $value) {
            $elements[] = $this->renderElements([]);
        }

        return [
            'elements' => $elements,
        ];
    }
}
