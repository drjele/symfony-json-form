<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Drjele\Symfony\JsonForm\Traits\ElementCollectionTrait;

/** used for repeatable collections of elements */
class PrototypeCollectionElement extends AbstractElement
{
    use ElementCollectionTrait;

    public function __construct(
        string $name,
        string $label,
        protected readonly bool $renderEmpty = true
    ) {
        parent::__construct($name, $label);
    }

    public function getType(): string
    {
        return 'prototypeCollection';
    }

    public function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_array($value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        $elements = [];

        foreach (($value ?? []) as $key => $v) {
            $elements[$key] = $this->renderElements($v);
        }

        if (true === $this->renderEmpty && null === $value) {
            $elements[] = $this->renderElements([]);
        }

        return [
            'elements' => $elements,
        ];
    }
}
